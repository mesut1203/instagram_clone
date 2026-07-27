import MessagesWorkspace from "./components/MessagesWorkspace";
import { getMessagePageData } from "./message-page-data";

export default async function MessagesPage() {
  const data = await getMessagePageData();

  return <MessagesWorkspace {...data} />;
}
