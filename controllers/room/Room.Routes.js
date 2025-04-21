const express = require('express');

const router = express.Router();

const multer = require("multer");
const { addRoom, deleteRoom, getAllRooms, getRoomById, updateRoom, addRoomImage, deleteRoomImage, updateMainImage, updateRoomPricing, createSpecialPricing, updateSpecialPricing, getSpecialPrice, addRoomType, getRoomTypes, deleteRoomType, updateRoomType, getRoomTypeImage, getRoomsImage, getRoomTypeById, changeRoomActiveStatis, getAllRoomsNotAllData, getRoomPrices, getSpecialPriceForRoom, getAvailableRoomPerType, getRoomTypeForNavbar, getRoomTypeAndRoomsByTypeId, getRoomTypeAndRoomsByTypeIdWithoutDate, getAllRoomTypesWithRoomsWithoutDate, getAllRoomTypesWithAvailableRoomsByDate } = require('./Room.Controller');
const { uploadRoomImages, uploadSingleRoomImage } = require('../../config/multerConfig');
const { verifyTokenAdmin } = require('../../middleware/verifyToken');
const upload = multer();


router.post('/', uploadRoomImages, addRoom);
router.post('/addRoomImage/:id', uploadSingleRoomImage, addRoomImage)
router.post('/addSpecialPrice', createSpecialPricing)

//Room Type
router.post('/addRoomType', addRoomType)
router.get('/roomTypes', getRoomTypes)
router.get('/roomType/:id', getRoomTypeById)
router.get('/get/RoomTypeForNavbar', getRoomTypeForNavbar)
router.get('/get/RoomTypeWithRooms/:id', getRoomTypeAndRoomsByTypeId)
router.get('/get/RoomTypeRoomsNoDates/:id', getRoomTypeAndRoomsByTypeIdWithoutDate)
router.get('/get/allRoomTypeRoomsNoDates', getAllRoomTypesWithRoomsWithoutDate)
//

router.get('/', getAllRooms)
router.get('/:id', getRoomById);
router.get('/get/allSpecialPrice', getSpecialPrice)
router.get('/get/RoomTypeImage/:id', getRoomTypeImage)
router.get('/get/RoomsImage', getRoomsImage)
router.get('/get/allRoomsNotAllData', getAllRoomsNotAllData)
router.get('/get/roomPrices/:id', getRoomPrices)
router.get('/get/specialPrice/:id', getSpecialPriceForRoom)
router.get('/get/availableRoomPerType', getAvailableRoomPerType)
router.get('/get/availableRooms', getAllRoomTypesWithAvailableRoomsByDate)

router.put('/:id', upload.none(), updateRoom);
router.patch('/changeMainImage/:id', uploadSingleRoomImage, updateMainImage)
router.patch('/changePricing/:id', updateRoomPricing)
router.put('/changeSpecialPrice/:id', updateSpecialPricing)
router.patch('/:id/toggle-active', changeRoomActiveStatis);

//Room Type
router.put('/roomTypeUpdate/:id', updateRoomType)
router.delete('/roomTypeDelete/:id', deleteRoomType)
//

router.delete('/:id', deleteRoom)
router.delete('/roomImage/:id', deleteRoomImage)

module.exports = router;

