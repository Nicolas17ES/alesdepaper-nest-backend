import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany} from'typeorm'
import { RefreshToken } from './refresh-token.entity';


@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true})
    email: string

    @Column()
    username: string

    @Column()
    password: string

    @Column({ length: 50 })
    role: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
    refreshTokens: RefreshToken[];
}