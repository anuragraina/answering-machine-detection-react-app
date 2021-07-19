import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography } from '@material-ui/core';
import moment from 'moment';

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
	const [accessToken, setAccessToken] = useState('');
	const [streams, setStreams] = useState({});
	const [events, setEvents] = useState([]);
	const [liveTranscript, setLiveTranscript] = useState({
		payload: {
			content: '',
		},
	});

	useEffect(() => {
		axios
			.post('https://api.symbl.ai/oauth2/token:generate', {
				type: 'application',
				appId: symblAppId,
				appSecret: symblAppSecret,
			})
			.then(response => {
				setAccessToken(response.data.accessToken);
				console.log('Fetched access token');
			})
			.catch(err => {
				console.log(err);
			});
	}, []);

	console.log(streams);
	console.log(events);

	const compareEvents = (event1, event2) => {
		return (
			event1.type === event2.type &&
			event1.title === event2.title &&
			event1.description === event2.description
		);
	};

	const addEvent = event => {
		if (events.length > 0) {
			if (events.filter(_event => compareEvents(_event, event)).length > 0) {
				return;
			}
		}

		const timestamp = moment().format('hh:mm a');

		const newEvent = { ...event, timestamp };
		setEvents(prevEvents => [...prevEvents, newEvent]);
	};

	const onSpeechDetected = async data => {
		if (data.type === 'message' && data.message.type === 'conversation_created') {
			addEvent({
				type: 'conversation_created',
				title: 'Conversation Created',
				description: `Conversation Id: ${data.message.data.conversationId}`,
			});
		} else if (data.type === 'message' && data.message.type === 'recognition_started') {
			addEvent({
				type: 'recognition_started',
				title: 'Recognition Started',
			});
		} else if (data.type === 'message' && data.message.hasOwnProperty('punctuated')) {
			setLiveTranscript({
				payload: {
					content: data.message.punctuated.transcript,
				},
			});
		} else if (data.type === 'topic_response') {
			for (let topic of data.topics) {
				addEvent({
					type: 'topic',
					title: `Topic Detected`,
					description: `Topic: ${topic.phrases}`,
				});
			}
		} else if (data.type === 'insight_response') {
			const { insights } = data;
			if (insights.length > 0) {
				insights.forEach(insight => {
					if (insight.type === 'question') {
						addEvent({
							type: 'question',
							title: `Question Detected`,
							description: `Question: ${insight.payload.content}`,
						});
					} else if (insight.type === 'action_item') {
						addEvent({
							type: 'action_item',
							title: `Action Item Detected`,
							description: `Action Item: ${insight.payload.content}`,
						});
					} else if (insight.type === 'follow_up') {
						addEvent({
							type: 'follow_up',
							title: `Follow Up Detected`,
							description: `Follow Up: ${insight.payload.content}`,
						});
					}
				});
			}
		}
	};

	const start = async () => {
		try {
			if (accessToken) {
				const streamsResponse = await startStream(accessToken, onSpeechDetected);
				setStreams(streamsResponse);
			} else {
				window.alert(
					'Error fetching access token! Please check the API keys or try again.'
				);
			}
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
				<LiveTranscript transcriptResponse={liveTranscript} />
			</Grid>
			<Grid container direction='row' justify='center' alignItems='flex-start' spacing={3}>
				<Grid item xs={12} sm={6}>
					<Paper variant={'outlined'} className={classes.paper}>
						<Typography variant={'h6'} style={{ marginBottom: 15, paddingBottom: 10 }}>
							Configurations
						</Typography>
						<button onClick={start} disabled={Object.keys(streams).length > 0}>
							Start
						</button>
						<button onClick={stop} disabled={Object.keys(streams).length === 0}>
							Stop
						</button>
					</Paper>
				</Grid>
				<Grid item xs={12} sm={6}>
					<EventsTimeline events={events} />
				</Grid>
			</Grid>
		</Container>
	);
}

export default SpeechToText;
