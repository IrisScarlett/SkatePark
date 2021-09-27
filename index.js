//Importaciones
const express = require('express');
const app = express();
const exphbs = require('express-handlebars')
const expressFileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const secretKey = 'Shhhh';

const {
    nuevoSkater, 
    getSkater,
    actualizarSkater,
    eliminarSkater,
    getSkaters,
    cambiarEstado
} = require('./consultas');

app.listen(3000, () => console.log('Server on'));


//Middlewares
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(expressFileUpload({
    limits: 5000000,
    abortOnLimit: true,
    responseOnLimit: 'El tamaño de la imagen supera el límite permitido',
}));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.engine(
    'handlebars',
    exphbs({
        defaultLayout: 'main',
        layoutsDir: `${__dirname}/views/mainLayout`,
    })
);
app.set('view engine', 'handlebars');

//Rutas

app.get('/', async (req, res) => {
    try{
        const skaters = await getSkaters();
        res.render('index', { skaters });
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

app.get('/registro', (req, res) => {
    res.render('Registro');
})

app.get('/Admin', async (req, res) => {
    try{
        const skaters = await getSkaters();
        res.render('Admin', { skaters });
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        });
    };
})

app.post('/skaters', async (req, res) => {
    const {
        email,
        nombre,
        password,
        anos_experiencia,
        especialidad, 
    } = req.body;
    const {
        files
    } = req
    const {
        foto
    } = files;
    const {
        name
    } = foto;

    foto.mv(`${__dirname}/public/fotos/${name}`, async (err) => {
        if (err) return res.status(500).send({
            error: `Algo salio mal... ${err}`,
            code: 500
        })

        try {
            await nuevoSkater(email, nombre, password, anos_experiencia, especialidad, name);
            res.send(`
                <script>
                alert('Skater registrado');
                window.location.href='/login';
                </script>
            `)
        } catch (e) {
            res.status(500).send({
                error: `Ups, hubo un problema... ${e}`,
                code: 500
            })
        };
    });
});

app.get('/login', async (req, res) => {
    res.render('Login')
})

app.post('/verify', async function(req, res) {
    const {email, password} = req.body;
    const skater = await getSkater(email, password);

    if(skater) {
        if(skater.estado){
            const token = jwt.sign(
                {
                    exp: Math.floor(Date.now() / 1000) + 300,
                    data: skater,
                },
                secretKey
            );
            res.send(token);
        } else {
            res.status(401).send({
                error: 'Este usuario aún no ha sido validado cambiar su correo o foto',
                code: 401,
            });
        }     
    } else {
        res.status(404).send({
            error: 'Este usuario no está registrado en la base de datos',
            code: 404,
        });
    }
})

app.get('/Datos', (req, res) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err, decoded) => {
        const { data } = decoded
        const datosSkater = data
        err ?
        res.status(401).send(
            res.send({
                error: '401 Unauthorized',
                message: 'Usted no está autorizado para estar aquí',
                token_error: err.message,
            })
        )
        : res.render('Datos', { datosSkater })
    })
})

app.put('/skaters', async (req, res) => {
    const { email, nombre, anos_experiencia, especialidad } = req.body;
    console.log(email, nombre, anos_experiencia, especialidad);
    try{
        const skater = await actualizarSkater(email, nombre, anos_experiencia, especialidad);
        res.send(skater)
    } catch (e) {
        res.send({
            error: `Algo salió mal... ${e}`
        })
    }
})

app.delete('/skaters', async (req, res) => {
    const { email } = req.body.source;
    try{
        const eliminado = await eliminarSkater(email);
        console.log(eliminado);
        res.render('index');
    } catch (e) {
        res.send({
            error: `Algo salió mal... ${e}`
        })
    }
})

app.put('/usuarios', async (req, res) => {
    const { id, estado } = req.body;
    try{
        const usuario = await cambiarEstado(id, estado);
        res.status(200).send(usuario);
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})