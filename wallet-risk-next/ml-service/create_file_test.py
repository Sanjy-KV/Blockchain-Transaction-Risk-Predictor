import os

print("SCRIPT STARTED")

print("Current working directory:")
print(os.getcwd())

file_path = os.path.join(os.getcwd(), "hello_created.txt")

with open(file_path, "w") as f:
    f.write("THIS FILE WAS CREATED")

print("FILE CREATED AT:", file_path)
