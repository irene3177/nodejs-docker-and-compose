import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  FindManyOptions,
  FindOneOptions,
  Like,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { hashValue } from '../helpers/hash';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Wish) private readonly wishRepository: Repository<Wish>,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const user = this.userRepository.create({
      ...createUserDto,
      password: await hashValue(password),
    });
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'Имя пользователя или электронная почта уже существуют.',
        );
      }
    }
  }

  async findById(id: number): Promise<User> {
    const user = await this.findOne({ where: { id } });
    return user;
  }

  async findOne(query: FindOneOptions<User>) {
    const user = await this.userRepository.findOneOrFail(query);
    return user;
  }

  async findMany(query: FindManyOptions<User>): Promise<User[]> {
    return await this.userRepository.find(query);
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { password } = updateUserDto;
    const user = await this.findOne({ where: { id } });
    if (password) {
      updateUserDto.password = await hashValue(password);
    }
    try {
      await this.userRepository.save({ ...user, ...updateUserDto });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'Имя пользователя или электронная почта уже существуют.',
        );
      }
    }
    return await this.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User> {
    return await this.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        about: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findUserWishes(user: User): Promise<Wish[]> {
    return await this.wishRepository
      .createQueryBuilder('wish')
      .leftJoinAndSelect('wish.owner', 'owner')
      .leftJoinAndSelect('wish.offers', 'offer')
      .leftJoinAndSelect('offer.user', 'offerUser')
      .leftJoinAndSelect('offerUser.wishes', 'wishes')
      .leftJoinAndSelect('offerUser.offers', 'offers')
      .leftJoinAndSelect('offers.user', 'user')
      .leftJoinAndSelect('offerUser.wishlists', 'wishlist')
      .leftJoinAndSelect('wishlist.owner', 'wishlistOwner')
      .leftJoinAndSelect('wishlist.items', 'wishlistItem')
      .where('owner.id = :id', { id: user.id })
      .getMany();
  }

  async findAllUserWishes(username: string): Promise<Wish[]> {
    const user: User = await this.findOne({ where: { username } });

    return await this.findUserWishes(user);
  }

  async findByUsernameOrEmail(query: string): Promise<User[]> {
    return await this.findMany({
      where: [{ username: Like(`%${query}%`) }, { email: Like(`%${query}%`) }],
    });
  }
}
