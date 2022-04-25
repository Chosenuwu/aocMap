const mongoose = require('mongoose');

const mapMarkerSchema = new mongoose.Schema({
  markerName: {
    type: String,
    required: [true, 'Please provide the name of the Map Marker']
  },
  mapMarkerMap: {
    type: Map,
    of: Number,
    required: [true, 'Please provide the coordinates']
  }
})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  
})

const MapMarker = mongoose.model('mapMarker', mapMarkerSchema);

module.exports = MapMarker