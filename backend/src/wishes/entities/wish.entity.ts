import { Entity, Column, OneToMany, ManyToOne, ManyToMany } from 'typeorm';
import { IsUrl, Length, IsNotEmpty, Min } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';
import { BaseEntity } from '../../common/base.entity';

@Entity()
export class Wish extends BaseEntity {
  @Column()
  @IsNotEmpty()
  @Length(1, 250)
  name: string;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  link: string;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  image: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  @IsNotEmpty()
  @Min(1)
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  @IsNotEmpty()
  @Min(1)
  raised: number;

  @Column('integer', {
    default: 0,
  })
  @IsNotEmpty()
  copied: number;

  @Column()
  @IsNotEmpty()
  @Length(1, 1024)
  description: string;

  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];

  @ManyToMany(() => Wishlist, (wishlist) => wishlist.items)
  wishlists: Wishlist[];
}
