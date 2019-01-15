const express = require('express');
const Sequelize = require('sequelize');
const cors = require("cors");

const app = express();
app.use('/', express.static('public'))
app.use(cors())

//connection to the db 
const sequelize = new Sequelize('travel', 'root', '', {
    dialect: "mysql",
    host: "localhost"
})

//authentication to the db
sequelize.authenticate().then(() => {
    console.log("Connected to database")
}).catch(() => {
    console.log("Unable to connect to database")
})

//define the table structures here

const TripRequest = sequelize.define('requests', {
    name:Sequelize.STRING, 
    lastName: Sequelize.STRING, 
    email:Sequelize.STRING, 
    hotel:Sequelize.STRING, 
    flight:Sequelize.STRING, 
    period:Sequelize.STRING
});

//==== ACCOUNTS ====
const Accounts = sequelize.define('accounts', {
    name: Sequelize.STRING, 
    username:{
        type: Sequelize.STRING, 
        unique: {
            msg: 'Your username must be unique'
        }, 
        allowNull: false
    }, 
    password: Sequelize.STRING, 
    email: Sequelize.STRING, 
    birthDate: Sequelize.DATE
});

//==== CITIES ====
const Cities = sequelize.define('cities', {
    name: Sequelize.STRING, 
    country: Sequelize.STRING
});

// ==== ATTRACTIONS ====
const Attractions = sequelize.define('attractions', {
    name: Sequelize.STRING, 
    description: Sequelize.TEXT, 
    idCity: Sequelize.INTEGER
});

// ==== HOTELS ====
const Hotels = sequelize.define('hotels', {
   name: Sequelize.STRING, 
   address: Sequelize.STRING, 
   description: Sequelize.TEXT, 
   stars: Sequelize.INTEGER, 
   idCity: Sequelize.INTEGER
});

//==== FLIGHTS ====
const Flights = sequelize.define('flights', {
    departureDate: Sequelize.DATE, 
    arrivalDate: Sequelize.DATE,
    airline: Sequelize.STRING,  
    idCity: Sequelize.INTEGER // this is the arrival city
});

// ==== FLIGHT RESERVATIONS ====
const FlightReservations = sequelize.define('flightReservations', {
    seat: Sequelize.STRING, 
    flightClass: Sequelize.STRING, 
    price: Sequelize.DOUBLE, 
    idFlight: Sequelize.INTEGER, //fk
    idUser: Sequelize.INTEGER //fk
});

// ==== HOTEL RESERVATIONS ====
const HotelReservations = sequelize.define('hotelReservations', {
    price: Sequelize.DOUBLE, 
    checkIn: Sequelize.DATEONLY, 
    checkOut: Sequelize.DATEONLY, 
    roomsBooked: Sequelize.INTEGER, 
    idHotel: Sequelize.INTEGER, //fk
    idUser: Sequelize.INTEGER //fk
});

// ==== PAYMENT ====
const Payments = sequelize.define('payments', {
    cardHolder: Sequelize.STRING,
    cardType: Sequelize.STRING, 
    cardNumber: Sequelize.INTEGER,
    expiringDate:Sequelize.DATEONLY,
    cvv: Sequelize.INTEGER, 
    amount: Sequelize.DOUBLE,
    idHotelReservation: Sequelize.INTEGER,
    idFlightReservation: Sequelize.INTEGER
});

//define the relations between tables here
Cities.hasMany(Attractions, {foreignKey:'idCity'});
Attractions.belongsTo(Cities, {foreignKey:'idCity'});
HotelReservations.belongsTo(Accounts, {foreignKey: 'idUser'});
Accounts.hasMany(HotelReservations, {foreignKey: 'idUser'});
Accounts.hasMany(FlightReservations, {foreignKey: 'idUser'});
FlightReservations.belongsTo(Accounts, {foreignKey: 'idUser'});
Hotels.belongsTo(Cities, {foreignKey: 'idCity'});
Flights.belongsTo(Cities, {foreignKey: 'idCity'});
Cities.hasMany(Hotels, {foreignKey:'idCity'});
Cities.hasMany(Flights, {foreignKey:'idCity'});
Hotels.hasMany(HotelReservations, {foreignKey: 'idHotel'});
Flights.hasMany(FlightReservations, {foreignKey:'idFlight'});
HotelReservations.belongsTo(Hotels, {foreignKey: 'idHotel'});
FlightReservations.belongsTo(Flights, {foreignKey:'idFlight'});
Payments.hasOne(HotelReservations, {foreignKey:'idHotelReservation'});
Payments.hasOne(FlightReservations, {foreignKey:'idFlightReservation'});

//use json files
app.use(express.json())

//url encoded
app.use(express.urlencoded())

app.get('/createdb', (request, response) => {
    sequelize.sync({force:true}).then(() => {
        response.status(200).send('tables created')
        console.log('tables created')
    }).catch((err) => {
        console.log(err)
        response.status(200).send('could not create tables')
    })
})


//define endpoints here

//insert accounts
app.post('/accounts',(request,response)=>{
    Accounts.create(request.body).then((account)=>{
        response.status(201).json(account);
    }).catch((error)=>{
        response.status(500).send(error.message);
    });
});

app.post('/requests',(request,response)=>{
    TripRequest.create(request.body).then((tripRequest)=>{
        response.status(201).json(tripRequest);
    }).catch((error)=>{
        response.status(500).send(error.message);
    });
});


app.get('/requests', (request, response) => {
    TripRequest.findAll().then((results) => {
        response.status(200).json(results)
    })
})

//select account by id
app.get('/accounts/:id', (request, response) => {
    Accounts.findById(request.params.id).then((result) => {
        if(result) {
            response.status(200).json(result)
        } else {
            response.status(404).send('resource not found')
        }
    }).catch((err) => {
        console.log(err)
        response.status(500).send('database error')
    })
})

//insert cities
app.post('/cities',(request,response)=>{
    Cities.create(request.body).then((city)=>{
        response.status(201).json(city);
    }).catch((error)=>{
        response.status(500).send(error.message);
    });
});

//select cities
app.get('/cities', (request, response) => {
    Cities.findAll().then((results) => {
        response.status(200).json(results)
    })
})



//insert hotels
app.post('/hotels',(request,response)=>{
    Hotels.create(request.body).then((hotel)=>{
        response.status(201).json(hotel);
    }).catch((error)=>{
        response.status(500).send(error.message);
    });
});


//insert flights
app.post('/flights',(request,response)=>{
    Flights.create(request.body).then((flight)=>{
        response.status(201).json(flight);
    }).catch((error)=>{
        response.status(500).send(error.message);
    });
});



//select hotels 
app.get('/hotels', (request, response) => {
    Hotels.findAll().then((results) => {
        response.status(200).json(results)
    })
})


//select flights
app.get('/flights', (request, response) => {
    Flights.findAll().then((results) => {
        response.status(200).json(results)
    })
})
//insert hotelreservation
app.post('/hotel-reservations',(request,response)=>{
    Hotels.create(request.body).then((hotelreservation)=>{
        response.status(201).json(hotelreservation);
    }).catch((error)=>{
        response.status(500).send(error.message);
    });
});
//insert flight-reservation
app.post('/flight-reservation',(request,response)=>{
    Hotels.create(request.body).then((flightreservation)=>{
        response.status(201).json(flightreservation);
    }).catch((error)=>{
        response.status(500).send(error.message);
    });
});

//select hotelReservation
app.get('/hotel-reservations', (request, response) => {
    HotelReservations.findAll().then((results) => {
        response.status(200).json(results)
    })
})


//select flightReservation
app.get('/flight-reservations', (request, response) => {
    FlightReservations.findAll().then((results) => {
        response.status(200).json(results)
    })
})



//insert payments
app.post('/payments',(request,response)=>{
    Hotels.create(request.body).then((payment)=>{
        response.status(201).json(payment);
    }).catch((error)=>{
        response.status(500).send(error.message);
    });
});
//select payments
app.get('/payments', (request, response) => {
    Payments.findAll().then((results) => {
        response.status(200).json(results)
    })
})
//insert attractions
app.post('/attractions',(request,response)=>{
    Attractions.create(request.body).then((attraction)=>{
        response.status(201).json(attraction);
    }).catch((error)=>{
        response.status(500).send(error.message);
    });
});
//select attraction
app.get('/attractions', (request, response) => {
        Attractions.findAll().then((results) => {
        response.status(200).json(results)
    })
})



app.listen(process.env.PORT, process.env.IP) 
