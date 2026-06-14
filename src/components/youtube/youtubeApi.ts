import { YoutubeResponse } from "../../commons/commonsData";
import boardClient from "../../board-commons";

// 키는 Express(.env)에만 있고, 프론트는 우리 서버(Express)만 호출 → 키 비노출
export const youtubeApi = async (keyword: string): Promise<YoutubeResponse> => {
  const { data } = await boardClient.get<YoutubeResponse>(
    `/youtube/find-node?query=${encodeURIComponent(keyword)}`
  );
  return data;
};
