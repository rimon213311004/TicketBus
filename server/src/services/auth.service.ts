import { User, IUser } from '../models';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens';
import { UserRole } from '../constants';

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

/** Keep the local operations account available without requiring a separate seed step. */
export async function ensureAdminAccount(): Promise<void> {
  let admin = await User.findOne({ role: 'admin' }).select('+password');
  if (!admin) admin = new User();

  admin.name = 'Rimon';
  admin.email = 'rimon@ticketbus.com';
  admin.phone = '01875895858';
  admin.password = '2002';
  admin.role = 'admin';
  admin.isActive = true;
  admin.isEmailVerified = true;
  await admin.save();
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
}

export function toPublicUser(user: IUser): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
  };
}

function issueTokens(user: IUser) {
  const payload = { sub: user._id.toString(), role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function register(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<AuthResult> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw AppError.conflict('An account with this email already exists');

  const user = await User.create({ ...input, email: input.email.toLowerCase() });
  return { user: toPublicUser(user), ...issueTokens(user) };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw AppError.unauthorized('Incorrect email or password');
  if (!user.isActive) throw AppError.forbidden('This account has been deactivated');

  const matches = await user.comparePassword(password);
  if (!matches) throw AppError.unauthorized('Incorrect email or password');

  return { user: toPublicUser(user), ...issueTokens(user) };
}

export async function refresh(token: string): Promise<AuthResult> {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw AppError.unauthorized('Session expired, please sign in again');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw AppError.unauthorized('Account is no longer available');

  return { user: toPublicUser(user), ...issueTokens(user) };
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found');
  return toPublicUser(user);
}

export async function updateProfile(
  userId: string,
  input: { name?: string; phone?: string; avatar?: string },
): Promise<PublicUser> {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found');

  if (input.name !== undefined) user.name = input.name;
  if (input.phone !== undefined) user.phone = input.phone;
  if (input.avatar !== undefined) user.avatar = input.avatar;

  await user.save();
  return toPublicUser(user);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await User.findById(userId).select('+password');
  if (!user) throw AppError.notFound('User not found');

  const matches = await user.comparePassword(currentPassword);
  if (!matches) throw AppError.unauthorized('Your current password is incorrect');

  // The pre-save hook hashes it, so assign the plain value.
  user.password = newPassword;
  await user.save();
}
