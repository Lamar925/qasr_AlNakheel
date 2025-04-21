import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("fs");
import { fileURLToPath } from "url";
import { deleteImageFromCloudinary } from "../../config/helpers/cloudinary.mjs";

const path = require("path");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Sequelize = require("../../config/dbConnection");
const PoolImages = require("../../models/PoolImages.model");
const Pool = require("../../models/Pool.model");
const PoolFacilities = require("../../models/PoolFacilities.model");

const { getMessage } = require("../language/messages");
const getLanguage = (req) => (req.headers["accept-language"] === "ar" ? "ar" : "en");


export const createPool = async (req, res) => {
    const lang = getLanguage(req);
    const { name_ar, name_en, size, depth, opening_hours, max_capacity, pool_type, hourly_rate } = req.body

    if (!name_ar || !name_en || !size || !depth || !opening_hours || !max_capacity || !pool_type || !hourly_rate) {
        return res.status(400).json({ message: getMessage("missingFields", lang) });
    }

    const t = await Sequelize.transaction();
    try {
        const pool = await Pool.create({
            name: { ar: name_ar, en: name_en },
            size,
            depth,
            opening_hours,
            max_capacity,
            pool_type,
            hourly_rate,
        }, { transaction: t });

        await PoolImages.create({
            pool_id: pool.id,
            image_name_url: req.files.mainImage && req.files.mainImage[0] ? req.files.mainImage[0].path : null,
            main: true,
        }, { transaction: t });

        if (req.files.additionalImages) {
            const additionalImages = req.files.additionalImages.map((file) => ({
                pool_id: pool.id,
                image_name_url: file.path,
                main: false,
            }));
            await PoolImages.bulkCreate(additionalImages, { transaction: t });
        }

        await t.commit();

        res.status(201).json({ message: getMessage("addedPool", lang), pool });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            message: getMessage("serverError", lang),
            error: error.message,
        });
    }
};

export const getPools = async (req, res) => {
    const pools = await Pool.findAll(
        {
            include: [
                { model: PoolImages, as: "images" },
                { model: PoolFacilities, as: "facilities" },
            ],
        }
    );
    if (!pools) return res.status(404).json({ message: getMessage("poolsNotFound", lang) });
    res.status(200).json(pools);
};

export const getPoolById = async (req, res) => {
    const lang = getLanguage(req);
    const { id } = req.params;
    const pool = await Pool.findByPk(id,
        {
            include: [
                { model: PoolImages, as: "images" },
                { model: PoolFacilities, as: "facilities" },
            ],
        }
    );
    if (!pool) return res.status(404).json({ message: getMessage("poolNotFound", lang) });

    res.status(200).json(pool);
};

export const updatePool = async (req, res) => {
    const lang = getLanguage(req);
    const { id } = req.params;
    const { name_ar, name_en, size, depth, opening_hours, max_capacity, pool_type, hourly_rate } = req.body;
    const pool = await Pool.findByPk(id);
    if (!pool) return res.status(404).json({ message: getMessage("poolNotFound", lang) });

    if (!name_ar || !name_en || !size || !depth || !opening_hours || !max_capacity || !pool_type || !hourly_rate) {
        return res.status(400).json({ message: getMessage("missingFields", lang) });
    }
    await pool.update({
        name: { ar: name_ar, en: name_en },
        size,
        depth,
        opening_hours,
        max_capacity,
        pool_type,
        hourly_rate,
    });

    res.status(200).json({ message: getMessage("updatedPool", lang), pool });
};

export const addPoolImage = async (req, res) => {
    const lang = getLanguage(req);

    const pool_id = req.params.id;

    if (!req.file) {
        return res.status(400).json({ message: getMessage("missingImage", lang) });
    }

    const poolImage = await PoolImages.create({
        pool_id,
        image_name_url: req.file.path,
        main: false,
    });

    res.status(201).json({ message: getMessage("addedImage", lang), poolImage: poolImage });
}

export const updateMainImage = async (req, res) => {
    const lang = getLanguage(req);
    const id = req.params.id;

    const poolImage = await PoolImages.findByPk(id);

    if (!poolImage) {
        return res.status(404).json({ message: getMessage("imageNotFound", lang) });
    }

    if (poolImage.image_name_url) {
        await deleteImageFromCloudinary(poolImage.image_name_url);
    }

    await poolImage.update({
        image_name_url: req.file.path,
    });
    res.status(200).json({ message: getMessage("updatedImage", lang) });
}

export const addFacility = async (req, res) => {
    const lang = getLanguage(req);
    const pool_id = req.params.id;

    const { name_ar, name_en, description_ar, description_en } = req.body;
    console.log(req.file.filename)
    const image = req.file ? req.file.path : null;

    if (!name_ar || !name_en || !description_ar || !description_en) {
        return res.status(400).json({ message: getMessage("missingFields", lang) });
    }

    const facility = await PoolFacilities.create({
        pool_id,
        name: { ar: name_ar, en: name_en },
        description: { ar: description_ar, en: description_en },
        image
    });

    res.status(201).json({ message: getMessage("facilityAdded", lang), facility });
}

export const updateFacility = async (req, res) => {
    const lang = getLanguage(req);
    const { id } = req.params;
    const { name_ar, name_en, description_ar, description_en } = req.body;
    let image = req.file ? req.file.path : null;

    if (!id || !name_ar || !name_en || !description_ar || !description_en) {
        return res.status(400).json({ message: getMessage("missingFields", lang) });
    }

    const facility = await PoolFacilities.findByPk(id);
    if (!facility) {
        return res.status(404).json({ message: getMessage("facilityNotFound", lang) });
    }

    const updateData = {
        name: { ar: name_ar, en: name_en },
        description: { ar: description_ar, en: description_en }
    };

    if (image) {
        updateData.image = image;
        await deleteImageFromCloudinary(facility.image);
    }

    await facility.update(updateData);

    res.status(200).json({ message: getMessage("facilityUpdated", lang), facility });
}

export const deleteFacility = async (req, res) => {
    const lang = getLanguage(req);

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: getMessage("missingFields", lang) });
    }

    const facility = await PoolFacilities.findByPk(id);

    if (!facility) {
        return res.status(404).json({ message: getMessage("facilityNotFound", lang) });
    }
    if (facility.image) {
        await deleteImageFromCloudinary(facility.image);
    }
    await facility.destroy();

    res.status(200).json({ message: getMessage("facilityDeleted", lang) });
}


export const deletePoolImage = async (req, res) => {
    const lang = getLanguage(req);
    const image_id = req.params.id;

    const poolImage = await PoolImages.findByPk(image_id);

    if (!poolImage) {
        return res.status(404).json({ message: getMessage("imageNotFound", lang) });
    }
    if (poolImage.main === true) {
        return res.status(400).json({ message: getMessage("cannotDeleteMainImage", lang) });
    }

    if (poolImage.image_name_url) {
        await deleteImageFromCloudinary(poolImage.image_name_url);
    }

    await poolImage.destroy();

    res.status(200).json({ message: getMessage("deletedImage", lang) });
}

export const deletePool = async (req, res) => {
    const lang = getLanguage(req);

    const pool_id = req.params.id;

    const images = await PoolImages.findAll({ where: { pool_id: pool_id } });

    const fImages = await PoolFacilities.findAll({ where: { pool_id: pool_id } })

    for (const image of images) {
        if (image.image_name_url) {
            await deleteImageFromCloudinary(image.image_name_url);
        }
    }

    for (const image of fImages) {
        if (image.image) {
            await deleteImageFromCloudinary(image.image);
        }
    }

    const pool = await Pool.findByPk(pool_id);

    if (!pool) {
        return res.status(404).json({ message: getMessage("poolNotFound", lang) });
    }

    await pool.destroy();

    res.status(200).json({ message: getMessage("poolDeleted", lang) });
}