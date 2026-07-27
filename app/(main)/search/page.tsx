import { getSearchHistory } from "@/app/services/search.action";
import { getSuggestedUsers } from "@/app/services/user.action";
import SearchExperience from "./SearchExperience";

export default async function SearchPage() {
  const [historyResult, suggestedUsersResult] = await Promise.all([
    getSearchHistory(),
    getSuggestedUsers(),
  ]);

  return (
    <SearchExperience
      initialHistory={
        historyResult.success ? historyResult.data : []
      }
      initialHistoryError={
        historyResult.success ? undefined : historyResult.message
      }
      initialSuggestedUsers={
        suggestedUsersResult.success ? suggestedUsersResult.data : []
      }
      initialSuggestedUsersError={
        suggestedUsersResult.success
          ? undefined
          : suggestedUsersResult.message
      }
    />
  );
}
