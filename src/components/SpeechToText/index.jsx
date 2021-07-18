import axios from 'axios';
import { symblAppId, symblAppSecret } from '../../config';
import { startStream } from '../../utils/speech-to-text';

function SpeechToText() {
	const start = async () => {
		try {
			const response = await axios.post('https://api.symbl.ai/oauth2/token:generate', {
				type: 'application',
				appId: symblAppId,
				appSecret: symblAppSecret,
			});

			startStream(response.data.accessToken);
		} catch (e) {
			console.log(e);
		}
	};
	return (
		<div>
			<button onClick={start}>Start</button>
		</div>
	);
}

export default SpeechToText;
