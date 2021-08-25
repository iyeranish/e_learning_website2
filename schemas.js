const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.courseSchema=Joi.object({
    course:Joi.object({
        title:Joi.string().required().escapeHTML(),
        description:Joi.string().required().escapeHTML()
    }).unknown().required()
})

module.exports.lessonSchema=Joi.object({
    lesson:Joi.object({
        title:Joi.string().required().escapeHTML(),
        lessonUrl:Joi.string().required().escapeHTML()
    }).unknown().required()
})

module.exports.userSchema=Joi.object({
    user:Joi.object({
        first_name:Joi.string().required().escapeHTML(),
        last_name:Joi.string().required().escapeHTML(),
        street_address:Joi.string().required().escapeHTML(),
        city:Joi.string().required().escapeHTML(),
        state:Joi.string().required().escapeHTML(),
        pincode:Joi.number().required(),
        email:Joi.string().email().required().escapeHTML(),
        username:Joi.string().required().escapeHTML(),
        password:Joi.string().required().escapeHTML(),
        password2:Joi.string().required().escapeHTML(),
        type:Joi.string().required().escapeHTML(),
        gender:Joi.string().required().escapeHTML(),
        username:Joi.string().required().escapeHTML(),
    }).required()
})

