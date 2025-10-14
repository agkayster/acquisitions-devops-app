import express from 'express';

/* router allows you to create routes */
const router = express.Router();

router.post('/sign-up', (req, res) => {
  // Handle user sign-up logic here
  res.status(201).send('POST /api/auth/sign-up response');
});

router.post('/sign-in', (req, res) => {
  // Handle user sign-up logic here
  res.status(201).send('POST /api/auth/sign-in response');
});

router.post('/sign-out', (req, res) => {
  // Handle user sign-up logic here
  res.status(201).send('POST /api/auth/sign-out response');
});

export default router;
