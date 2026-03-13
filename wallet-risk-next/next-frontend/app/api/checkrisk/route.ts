import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address || !address.startsWith("0x")) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
    }

    const apiKey = process.env.ETHERSCAN_API_KEY;
    const BASE = `https://api.etherscan.io/v2/api?chainid=1&apikey=${apiKey}`;

    console.log("Address:", address);

    // ---- run all 3 calls in parallel for speed ----
    const [nonceRes, txRes, balRes] = await Promise.all([
      fetch(`${BASE}&module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest`),
      fetch(`${BASE}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc`),
      fetch(`${BASE}&module=account&action=balance&address=${address}&tag=latest`),
    ]);

    const [nonceData, txData, balData] = await Promise.all([
      nonceRes.json(),
      txRes.json(),
      balRes.json(),
    ]);

    console.log("Nonce:", JSON.stringify(nonceData));
    console.log("TxList status:", txData?.status, "| count:", txData?.result?.length);
    console.log("Balance status:", balData?.status);

    // nonce = real outgoing tx count for wallets
    let tx_count = 0;
    if (nonceData?.result) {
      const parsed = parseInt(nonceData.result, 16);
      tx_count = isNaN(parsed) ? 0 : parsed;
    }

    // fallback for contract addresses where nonce = 0
    if (tx_count === 0 && txData?.status === "1" && Array.isArray(txData.result)) {
      tx_count = txData.result.length;
    }

    // avg gas price from last 5 txs (in Gwei)
    let avg_gas_gwei = 0;
    if (txData?.status === "1" && Array.isArray(txData.result) && txData.result.length > 0) {
      let totalGas = 0;
      txData.result.forEach((tx: any) => {
        totalGas += parseFloat(tx.gasPrice || "0") / 1e9;
      });
      avg_gas_gwei = totalGas / txData.result.length;
    }

    // avg ETH per tx derived from current balance
    let avg_amount = 0;
    if (balData?.status === "1" && balData?.result) {
      const balEth = parseFloat(balData.result) / 1e18;
      avg_amount = tx_count > 0
        ? parseFloat((balEth / tx_count).toFixed(6))
        : parseFloat(balEth.toFixed(6));
    }

    // gas variance: log10 of avg gas in Gwei
    const gas_variance = parseFloat(Math.log10(avg_gas_gwei + 1).toFixed(4));

    console.log("FEATURES → tx_count:", tx_count, "| avg_amount:", avg_amount, "| gas_variance:", gas_variance);

    // ---- call Flask ML service ----
    const mlResponse = await fetch("http://127.0.0.1:5000/ml", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tx_count, avg_amount, gas_variance }),
    });

    if (!mlResponse.ok) {
      throw new Error(`ML service error: ${mlResponse.status}`);
    }

    const mlData = await mlResponse.json();
    console.log("ML response:", JSON.stringify(mlData));

    const rawScore: number = mlData?.result?.score ?? 0;
    const score100 = Math.min(100, Math.round(rawScore * 100));

    return NextResponse.json({
      address,
      tx_count,
      avg_amount,
      gas_variance,
      score: score100,
      level: mlData?.result?.level ?? "LOW RISK",
      reason: mlData?.result?.reason ?? "Normal behavior",
    });

  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json({
      score: 0,
      level: "LOW RISK",
      reason: "Prediction failed",
    });
  }
}