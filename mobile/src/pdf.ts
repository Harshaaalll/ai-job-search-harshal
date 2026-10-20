import { Alert } from "react-native";
import * as Sharing from "expo-sharing";
import { ApiError, type Api } from "./api";

/** Download a CV / cover-letter PDF (token attached) and hand it to the system viewer / share sheet. */
export async function openPdf(api: Api | null, repoPath: string): Promise<void> {
  if (!api) return Alert.alert("Not connected", "Set the server address in Settings first.");
  try {
    const uri = await api.downloadFile(repoPath);
    if (!(await Sharing.isAvailableAsync())) return Alert.alert("Cannot open", "Sharing is not available on this device.");
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: repoPath.split("/").pop() });
  } catch (e) {
    Alert.alert("Could not open PDF", e instanceof ApiError ? e.message : "Download failed");
  }
}
