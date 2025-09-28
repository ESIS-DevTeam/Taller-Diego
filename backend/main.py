from fastapi import FastAPI
from api.v1.routes import producto_routes, venta_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(producto_routes.router,
                   prefix="/api/v1/productos", tags=["Productos"])
app.include_router(venta_routes.router,
                   prefix="/api/v1/ventas", tags=["Ventas"])

@app.get("/")
def read_root():
    return {"Hello": "World"}
