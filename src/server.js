const express = require('express');
const path = require('path');
require('dotenv').config();

const { ConnectToDatabase, ToObjectId, CloseDatabase } = require('./db');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function BuildDeviceQuery(query) {
  const filter = {};

  if (query.room) {
    filter.room = query.room;
  }
  
  if (query.status) {
    filter.status = query.status;
  }

  if (query.name) {
    filter.name = { $regex: query.name, $options: 'i' };
  }

  if (query.minBattery || query.maxBattery) {
    filter.battery = {};
    if (query.minBattery) filter.battery.$gte = Number(query.minBattery);
    if (query.maxBattery) filter.battery.$lte = Number(query.maxBattery);
  }

  return filter;
}

function ValidateDevice(device) {
  if (!device.name || typeof device.name !== 'string') {
    return 'Device name is required.';
  }
  if (!device.room || typeof device.room !== 'string') {
    return 'Room assignment is required.';
  }
  if (!device.status || typeof device.status !== 'string') {
    return 'Device status is required.';
  }
  if (!Number.isInteger(device.battery) || device.battery < 0 || device.battery > 100) {
    return 'Battery must be an integer between 0 and 100.';
  }
  return null;
}

app.get('/api/health', async (request, response) => {
  const collection = await ConnectToDatabase();
  const count = await collection.countDocuments();
  response.json({ status: 'ok', database: process.env.DB_NAME, devices: count });
});

app.get('/api/devices', async (request, response) => {
  const collection = await ConnectToDatabase();
  const filter = BuildDeviceQuery(request.query);
  const devices = await collection.find(filter).sort({ name: 1 }).toArray();
  response.json(devices);
});

app.get('/api/devices/:id', async (request, response) => {
  const id = ToObjectId(request.params.id);
  if (!id) {
    return response.status(400).json({ error: 'Invalid device id.' });
  }

  const collection = await ConnectToDatabase();
  const device = await collection.findOne({ _id: id });

  if (!device) {
    return response.status(404).json({ error: 'Device not found.' });
  }

  response.json(device);
});

app.post('/api/devices', async (request, response) => {
  const device = {
    name: request.body.name,
    room: request.body.room,
    status: request.body.status,
    battery: Number(request.body.battery)
  };

  const error = ValidateDevice(device);
  if (error) {
    return response.status(400).json({ error });
  }

  try {
    const collection = await ConnectToDatabase();
    const result = await collection.insertOne(device);
    response.status(201).json({ ...device, _id: result.insertedId });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ error: 'A device with this name already exists.' });
    }
    throw error;
  }
});

app.put('/api/devices/:id', async (request, response) => {
  const id = ToObjectId(request.params.id);
  if (!id) {
    return response.status(400).json({ error: 'Invalid device id.' });
  }

  const device = {
    name: request.body.name,
    room: request.body.room,
    status: request.body.status,
    battery: Number(request.body.battery)
  };

  const error = ValidateDevice(device);
  if (error) {
    return response.status(400).json({ error });
  }

  const collection = await ConnectToDatabase();
  const result = await collection.findOneAndUpdate(
    { _id: id },
    { $set: device },
    { returnDocument: 'after' }
  );

  if (!result) {
    return response.status(404).json({ error: 'Device not found.' });
  }

  response.json(result);
});

app.patch('/api/devices/:id', async (request, response) => {
  const id = ToObjectId(request.params.id);
  if (!id) {
    return response.status(400).json({ error: 'Invalid device id.' });
  }

  const updates = {};
  if (request.body.name !== undefined) updates.name = request.body.name;
  if (request.body.room !== undefined) updates.room = request.body.room;
  if (request.body.status !== undefined) updates.status = request.body.status;
  if (request.body.battery !== undefined) updates.battery = Number(request.body.battery);

  const collection = await ConnectToDatabase();
  const result = await collection.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { returnDocument: 'after' }
  );

  if (!result) {
    return response.status(404).json({ error: 'Device not found.' });
  }

  response.json(result);
});

app.delete('/api/devices/:id', async (request, response) => {
  const id = ToObjectId(request.params.id);
  if (!id) {
    return response.status(400).json({ error: 'Invalid device id.' });
  }

  const collection = await ConnectToDatabase();
  const result = await collection.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    return response.status(404).json({ error: 'Device not found.' });
  }

  response.status(204).send();
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ error: 'Server error.' });
});

const server = app.listen(port, () => {
  console.log(`Devices API running on http://localhost:${port}`);
});

process.on('SIGTERM', async () => {
  await CloseDatabase();
  server.close();
});