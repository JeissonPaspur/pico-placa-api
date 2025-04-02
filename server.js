const express=require('express')
const app = express();

const port = 3000;

app.use(express.json());

//RUTA 
app.get('/',(req,res)=>{
    res.send("API REST PICO T PLACA, funcionando ")
})

//lista de rotacion
const ROTACION = ["0 y 1", "2 y 3", "4 y 5", "6 y 7", "8 y 9"];

//servicio api rest pico y placa
app.get('/pico', (req,res)=>{
    const fecha = new Date(2025, 0, 2);    //toLocaleString('es-CO',{ timeZone: 'America/Bogota'});
    const fechaInicial = new Date(2024, 11, 29);    //toLocaleString('es-CO',{ timeZone: 'America/Bogota'});
    const dias = Math.floor ((fecha - fechaInicial) / (1000 * 60 * 60 * 24));
    const semanas = Math.floor (dias / 7) + 1;
    const indice = semanas % 5 + 1; // semanas % rotacion.le
    const dia = fecha.getDay();
    res.json({fecha, fechaInicial, dias, semanas, indice, dia});
});

//INICIAMOS EL SERVIDOR 
app.listen(port,()=>{
    console.log("LOCASHOST CORRIENDO EN EL PUERTO ",port);

})