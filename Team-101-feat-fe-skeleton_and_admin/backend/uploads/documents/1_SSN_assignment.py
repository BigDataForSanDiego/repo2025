import json 
file_path = r"/Users/sahilkatle/Downloads/senator2.json"
try:
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
except UnicodeDecodeError:
    with open(file_path, 'r', encoding='cp1252') as file:
        data = json.load(file)

column = "phone"
col_values = [item.get(column) for item in data['objects'] if column in item]

print(f"Values are: {col_values}")
for value in col_values:
    print(value)
