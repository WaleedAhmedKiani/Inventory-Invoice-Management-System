import { prisma } from "../../config/db.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from "../../utils/jwt.js";
import redis from "../../config/redis.js";


// ^Register user services logic
export const registerUser = async (data: any) => {
  const { name, email, password, organizationName } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  //  ^TRANSACTION 
  const result = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: organizationName,
      },
    });

    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "OWNER",
        organizationId: organization.id,
      },
    });

    await tx.subscription.create({
      data: {
        organizationId: organization.id,
        plan: "FREE",
      },
    });

    return { user, organization };
  });

  const payload = {
    userId: result.user.id,
    email: result.user.email,
    organizationId: result.user.organizationId,
    role: result.user.role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

// ^Login user services logic
export const loginUser = async (data: any) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const payload = {
    userId: user.id,
    email: user.email,
    organizationId: user.organizationId,
    role: user.role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

// ^get user Profile
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organizationId: true,

      organization: {
        select: {
          id: true,
          plan: true,
          stripeCustomerId: true,

          subscription: {
            select: {
              status: true,
              currentPeriodEnd: true,
              stripeSubscriptionId: true,
            },
          },
        },
      },
    },
  });

  return user;
};


// ^Logout user services logic
export const logoutUser = async (userId: string) => {

  await redis.del(`refreshToken:${userId}`);
  return { success: true };
};