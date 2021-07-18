import { useState } from 'react';
import axios from 'axios';

import { symblAppId, symblAppSecret } from '../../config';
import { startStream, stopStream } from '../../utils/speech-to-text';

function SpeechToText() {
	const [streams, setStreams] = useState({});
	console.log(streams);

	const start = async () => {
		try {
			const response = await axios.post('https://api.symbl.ai/oauth2/token:generate', {
				type: 'application',
				appId: symblAppId,
				appSecret: symblAppSecret,
			});

			const streamsResponse = await startStream(response.data.accessToken);
			setStreams(streamsResponse);
		} catch (e) {
			console.log(e);
		}
	};

	const stop = async () => {
		try {
			await stopStream(streams);
			setStreams({});
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<div>
			<button onClick={start} disabled={Object.keys(streams).length > 0}>
				Start
			</button>
			<button onClick={stop} disabled={Object.keys(streams).length === 0}>
				Stop
			</button>
		</div>
	);
}

export default SpeechToText;
