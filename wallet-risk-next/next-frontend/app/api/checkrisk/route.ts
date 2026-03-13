import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {

    const { address } = await req.json();

    if (!address || !address.startsWith("0x")) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    const apiKey = process.env.ETHERSCAN_API_KEY;

    const url =
      `https://api.etherscan.io/api` +
      `?module=account&action=txlist` +
      `&address=${address}` +
      `&startblock=0&endblock=99999999` +
      `&page=1&offset=200&sort=asc` +
      `&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    let tx_count = 0;
    let avg_amount = 0;
    let gas_variance = 0;

    if (data?.result && Array.isArray(data.result)) {

      const txs = data.result;

      tx_count = txs.length;

      if (tx_count > 0) {

        const values = txs.map((tx: any) => Number(tx.value) / 1e18);

        avg_amount =
          values.reduce((a: number, b: number) => a + b, 0) / values.length;

        const gasPrices = txs.map((tx: any) => Number(tx.gasPrice));

        const mean =
          gasPrices.reduce((a: number, b: number) => a + b, 0) /
          gasPrices.length;

        const variance =
          gasPrices.reduce((sum: number, g: number) => sum + (g - mean) ** 2, 0) /
          gasPrices.length;

        gas_variance = Math.log10(Math.sqrt(variance) + 1);
      }
    }

    const mlResponse = await fetch("http://localhost:5000/ml", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tx_count,
        avg_amount,
        gas_variance
      })
    });

    const mlData = await mlResponse.json();

    return NextResponse.json({
      address,
      tx_count,
      avg_amount,
      gas_variance,
      score: mlData?.result?.score ?? 0,
      level: mlData?.result?.level ?? "LOW RISK",
      reason: mlData?.result?.reason ?? "Normal behavior"
    });

  } catch (error) {

    console.error("Prediction error:", error);

    return NextResponse.json({
      score: 0,
      level: "LOW RISK",
      reason: "Prediction failed"
    });

  }
}