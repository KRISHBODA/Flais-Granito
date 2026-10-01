const Settings = require("../models/Settings");

const DEFAULT_SETTINGS = {
  phone: '+91 9909911772',
  phone1: '+91 9909911772',
  phone2: '+91 98983 04831',
  email: 'info@flaisgranito.com',
  address: 'Survey No. 151/pl, Unchi Mandal, Halvad Highway, Gujarat 363642, India.',
  heroTitle: 'Contact Us',
  heroSubtitle: 'Have a question or planning a project? Reach out to our team of experts today.',
  heroMedia: '',
  facebook: 'https://www.facebook.com/share/1Eqo7HDYNb/',
  instagram: 'https://www.instagram.com/flais_tiles.and.adhesives/?hl=en',
  linkedin: 'https://www.linkedin.com/company/flais-granito',
  youtube: 'https://www.youtube.com/@flais_tiles.and.adhesives',
  pinterest: 'https://pin.it/3NKlK8ujW'
};

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(DEFAULT_SETTINGS);
    }
    const settingsObj = settings.toObject();
    const resolvedPhone = settingsObj.phone || settingsObj.phone1 || DEFAULT_SETTINGS.phone;
    const resolvedPhone1 = settingsObj.phone1 || (resolvedPhone ? resolvedPhone.split(',')[0].trim() : DEFAULT_SETTINGS.phone1);
    const resolvedPhone2 = settingsObj.phone2 || (resolvedPhone && resolvedPhone.includes(',') ? resolvedPhone.split(',')[1].trim() : DEFAULT_SETTINGS.phone2);

    res.status(200).json({
      success: true,
      settings: {
        ...DEFAULT_SETTINGS,
        ...settingsObj,
        phone: resolvedPhone,
        phone1: resolvedPhone1,
        phone2: resolvedPhone2
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const {
      phone,
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
      youtube,
      pinterest
    } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS);
    }
    if (phone !== undefined) {
      settings.phone = phone;
      const parts = String(phone).split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 0) {
        settings.phone1 = parts[0];
        if (parts.length > 1) {
          settings.phone2 = parts[1];
        }
      }
    }
    if (phone1 !== undefined) {
      settings.phone1 = phone1;
      if (phone === undefined) settings.phone = phone1;
    }
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
    if (pinterest !== undefined) settings.pinterest = pinterest;

    await settings.save();
    res.status(200).json({ success: true, message: "Settings updated successfully", settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
