const Event = require('../models/event');
const User  = require('../models/user');


exports.createEvent = async (req, res) => {
  try {
    const { title, dateTime, location, capacity } = req.body;


    if (capacity < 1 || capacity > 1000) {
      return res
        .status(400)
        .json({ message: 'Capacity must be between 1 and 1000.' });
    }


    const event = new Event({ title, dateTime, location, capacity });
    await event.save();


    res.status(201).json({ eventId: event._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Populate registrations array with full User docs
    const event = await Event.findById(id).populate('registrations', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.register = async (req, res) => {
  try {
    const { eventId, userId } = req.body;


    const [ event, user ] = await Promise.all([
      Event.findById(eventId),
      User.findById(userId),
    ]);
    if (!event || !user) {
      return res.status(404).json({ message: 'Event or user not found.' });
    }


    if (event.registrations.includes(userId)) {
      return res.status(400).json({ message: 'User already registered.' });
    }


    if (event.registrations.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is full.' });
    }


    if (new Date(event.dateTime) < new Date()) {
      return res.status(400).json({ message: 'Cannot register past events.' });
    }


    event.registrations.push(userId);
    await event.save();

    res.json({ message: 'Registration successful.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.cancel = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });


    const idx = event.registrations.indexOf(userId);
    if (idx === -1) {
      return res.status(400).json({ message: 'User not registered.' });
    }


    event.registrations.splice(idx, 1);
    await event.save();

    res.json({ message: 'Registration cancelled.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.listUpcoming = async (_, res) => {
  try {
    const now = new Date();
    const events = await Event.find({ dateTime: { $gt: now } })
      .sort({ dateTime: 1, location: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.stats = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const totalRegistered = event.registrations.length;
    const remaining      = event.capacity - totalRegistered;
    const percentUsed    = (totalRegistered / event.capacity) * 100;

    res.json({
      totalRegistered,
      remaining,
      percentUsed: percentUsed.toFixed(2) + '%',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
