import MessagesWorkspace from "../components/MessagesWorkspace";
import { getMessagePageData } from "../message-page-data";

type ConversationPageProps = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params;
  const data = await getMessagePageData(conversationId);

  return <MessagesWorkspace {...data} key={conversationId} />;
}
