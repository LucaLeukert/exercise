import Constants from "expo-constants";

export const getBaseUrl = () => {
	const debuggerHost = Constants.expoConfig?.hostUri;
	const localhost = debuggerHost?.split(":")[0];

	if (!localhost) {
		return "https://exercise-api.luca-acc.workers.dev";
	}
	return `http://10.25.97.107:8787`;
};
