import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

# Parse DATABASE_URL
db_url = os.getenv("DATABASE_URL")
# mysql+mysqlconnector://relink:relinkpass@127.0.0.1:3306/relink

parts = db_url.split("://")[1]
user_pass, host_db = parts.split("@")
user, password = user_pass.split(":")
host_port, database = host_db.split("/")
host = host_port.split(":")[0]

conn = mysql.connector.connect(
    host=host,
    user=user,
    password=password,
    database=database
)

cursor = conn.cursor()
cursor.execute("ALTER TABLE participants MODIFY COLUMN face_encoding LONGTEXT;")
conn.commit()
cursor.close()
conn.close()

print("✓ Successfully updated face_encoding column to LONGTEXT")
