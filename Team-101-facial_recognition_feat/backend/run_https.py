import uvicorn
import ssl

if __name__ == "__main__":
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(
        "../certs/localhost-cert.pem", 
        "../certs/localhost-key.pem"
    )
    
    uvicorn.run(
        "app.main:app",
        host="localhost",
        port=8000,
        ssl_keyfile="../certs/localhost-key.pem",
        ssl_certfile="../certs/localhost-cert.pem",
        reload=True
    )