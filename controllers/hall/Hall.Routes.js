const express = require('express');
const { addFacility, createHall, getHalls, getHallById, updateHall, addhallImage, updateMainImage, updateFacility, deleteFacility, deleteHallImage, deleteHall, getHallsNotAllData } = require('./Hall.Controller');
const { uploadFacilityImages, uploadHallImages, addHallImage } = require('../../config/multerConfig');
const router = express.Router();

const multer = require("multer");
const { createHallReservation, cancelReservation, acceptReservation, getReservationsByHall, getReservationsByDate, getAllReservations, deleteReservation, getFutureReservations, getReservationsByHallAndDate, getCustomerHallReservations } = require('./HallReservation.Controller');
const upload = multer();

router.post("/", uploadHallImages, createHall)
router.post('/addHallImage/:id', addHallImage, addhallImage)
router.post("/addFacility/:id", uploadFacilityImages, addFacility)

//Hall Reservation
router.post("/hallReservation/:id", upload.none(), createHallReservation)
router.get("/hallReservations", getAllReservations)
router.get("/customerHallReservation/:id", getCustomerHallReservations)
router.get("/hallReservationByHall/:id", getReservationsByHall)
router.get("/getReservationInDay/:date", getReservationsByDate)
router.get("/futureReservations", getFutureReservations)
router.get("/get/getReservationsByHallAndDate/:id", getReservationsByHallAndDate)
router.patch("/cancelHallReservation/:id", cancelReservation)
router.patch("/acceptHallReservation/:id", acceptReservation)
router.delete("/deleteReservation/:id", deleteReservation)
//

router.get('/', getHalls)
router.get('/get/hallsNameAndId', getHallsNotAllData)
router.get('/:id', getHallById)

router.put('/:id', upload.none(), updateHall)
router.put('/updateFacility/:id', uploadFacilityImages, updateFacility)
router.patch('/updateMainImage/:id', addHallImage, updateMainImage)

router.delete('/deleteFacility/:id', deleteFacility)
router.delete('/deleteHallImage/:id', deleteHallImage)
router.delete('/:id', deleteHall)

module.exports = router;