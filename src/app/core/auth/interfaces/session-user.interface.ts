import { UserEntity } from '../../users/interfaces/user.entity';

export type SessionUser = Omit<UserEntity, 'password'>;
