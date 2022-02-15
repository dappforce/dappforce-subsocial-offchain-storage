import { SignedMessage } from "../common"

export type UpsertLinkedEmailMessage = {
  email: string
}

export type UpsertLinkedEmail = SignedMessage<UpsertLinkedEmailMessage>