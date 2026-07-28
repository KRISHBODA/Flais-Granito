const Settings = require("../models/Settings");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const DEFAULT_SETTINGS = {
  phone1: '+91 95867 33300',
  phone2: '+91 98983 04831',
  email: 'info@flaisgranito.com',
  address: 'Survey No. 151/pl, Unchi Mandal, Halvad Highway, Gujarat 363642, India.',
  heroTitle: 'Contact Us',
  heroSubtitle: 'Have a question or planning a project? Reach out to our team of experts today.',
  heroMedia: '',
  facebook: 'https://www.facebook.com/FlaisTile/',
  instagram: 'https://www.instagram.com/flaisgranito/',
  linkedin: 'https://www.linkedin.com/company/flais-granito/',
  youtube: 'https://www.youtube.com/@FlaisGranito'
};

exports.getSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(DEFAULT_SETTINGS);
    }
    sendSuccess(res, 200, {
      settings: { ...DEFAULT_SETTINGS, ...settings.toObject() }
    });
});

exports.updateSettings = asyncHandler(async (req, res) => {
    const {
      phone1,
      phone2,
      email,
      address,
      heroTitle,
      heroSubtitle,
      heroMedia,
      facebook,
      instagram,
      linkedin,
      youtube
    } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS);
    }
    if (phone1 !== undefined) settings.phone1 = phone1;
    if (phone2 !== undefined) settings.phone2 = phone2;
    if (email !== undefined) settings.email = email;
    if (address !== undefined) settings.address = address;
    if (heroTitle !== undefined) settings.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) settings.heroSubtitle = heroSubtitle;
    if (heroMedia !== undefined) settings.heroMedia = heroMedia;
    if (facebook !== undefined) settings.facebook = facebook;
    if (instagram !== undefined) settings.instagram = instagram;
    if (linkedin !== undefined) settings.linkedin = linkedin;
    if (youtube !== undefined) settings.youtube = youtube;

    await settings.save();
    sendSuccess(res, 200, { message: "Settings updated successfully", settings });
});
