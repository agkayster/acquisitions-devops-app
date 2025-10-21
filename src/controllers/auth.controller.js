import logger from '#config/logger.js';
import { signupSchema } from '#validations/auth.validation.js';
import { formatValidationError } from '#utils/format.js';
import { createUser } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    // we need to validate the data coming into the form
    // req.body contains the form data filled by the user when signing up
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;

    // Implement AUTH SERVICE to create an account
    const user = await createUser({ name, email, password, role });

    // create JWT token for user
    const token = jwttoken.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // take token and set to cookies
    cookies.set(res, 'token', token);

    logger.info(
      `User registered successfully:, ${user.email}, ${user.name}, ${user.role}`
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Sign up error:', error);

    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    /* take this error and forward it over. next is used when something is considered a middleware */
    next(error);
  }
};
