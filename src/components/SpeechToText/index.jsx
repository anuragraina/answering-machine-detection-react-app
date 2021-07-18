import { startStream } from '../../utils/speech-to-text';

function SpeechToText() {
	const start = () => {
		startStream();
	};
	return (
		<div>
			<button onClick={start}>Start</button>
		</div>
	);
}

export default SpeechToText;
