import { useState } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography } from '@material-ui/core';

import { symblAppId, symblAppSecret } from '../../config';
import { startStream, stopStream } from '../../utils/speech-to-text';
import LiveTranscript from '../LiveTranscript';
import EventsTimeline from '../EventsTimeline';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
	},
	paper: {
		padding: theme.spacing(3),
	},
}));

function SpeechToText() {
	const classes = useStyles();
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
		<Container style={{ width: '100%' }}>
			{/*<Typography component="div" style={{ backgroundColor: '#cfe8fc', height: '100vh' }} />*/}
			<Grid container direction={'row'}>
				<LiveTranscript transcriptResponse={undefined} />
			</Grid>
			<Grid container direction='row' justify='center' alignItems='flex-start' spacing={3}>
				<Grid item xs={12} sm={6}>
					<Paper variant={'outlined'} className={classes.paper}>
						<Typography variant={'h6'} style={{ marginBottom: 15, paddingBottom: 10 }}>
							Configurations
						</Typography>
					</Paper>
				</Grid>
				<Grid item xs={12} sm={6}>
					<EventsTimeline events={null} />
				</Grid>
			</Grid>
		</Container>
	);
}

export default SpeechToText;

{
	/* <button onClick={start} disabled={Object.keys(streams).length > 0}>
				Start
			</button>
			<button onClick={stop} disabled={Object.keys(streams).length === 0}>
				Stop
			</button> */
}
