import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class ConversationParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ default: 'member' })
  role: string;

  @ManyToOne('Conversation', (conversation: any) => conversation.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: any;

  @ManyToOne('User', (user: any) => user.conversations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: any;
}
