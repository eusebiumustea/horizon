import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity()
@Index(['conversationId', 'sentAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @Column()
  senderId: string;

  @Column()
  content: string;

  @Column({ default: 'text' })
  messageType: string;

  @CreateDateColumn()
  sentAt: Date;

  @Column({ nullable: true })
  editedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne('Conversation', (conversation: any) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: any;

  @ManyToOne('User', (user: any) => user.sentMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: any;
}
