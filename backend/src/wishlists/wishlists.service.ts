import { ForbiddenException, Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { User } from '../users/entities/user.entity';
import { Wishlist } from './entities/wishlist.entity';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
  ) {}

  private async checkOwnership(
    wishlistId: number,
    currentUser: User,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne({
      where: { id: wishlistId },
      relations: ['owner'],
    });
    if (wishlist.owner.id !== currentUser.id) {
      throw new ForbiddenException('You are not authorized');
    }
    return wishlist;
  }
  async create(createWishlistDto: CreateWishlistDto, user: User) {
    const { name, image, itemsId } = createWishlistDto;
    const wishItems = await this.wishesRepository.findByIds(itemsId);

    const wishlist = this.wishlistRepository.create({
      name,
      image,
      items: wishItems,
      owner: user,
    });
    return await this.wishlistRepository.save(wishlist);
  }

  async findOne(query: FindOneOptions<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOneOrFail(query);
    return wishlist;
  }

  async findMany(query: FindManyOptions<Wishlist>): Promise<Wishlist[]> {
    return await this.wishlistRepository.find(query);
  }

  async updateOne(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    currentUser: User,
  ): Promise<Wishlist> {
    await this.checkOwnership(id, currentUser);
    await this.wishlistRepository.update(id, updateWishlistDto);
    return await this.findOne({ where: { id }, relations: ['owner', 'items'] });
  }

  async findById(id: number): Promise<Wishlist> {
    return await this.findOne({ where: { id }, relations: ['owner', 'items'] });
  }

  async removeOne(id: number, user: User): Promise<Wishlist> {
    const wishlist = await this.checkOwnership(id, user);
    await this.wishlistRepository.remove(wishlist);
    return wishlist;
  }
}
