import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import MicIcon from '@material-ui/icons/Mic';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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
	paperMargin: {
		padding: theme.spacing(3),
		marginTop: theme.spacing(3),
	},
	button: {
		marginLeft: theme.spacing(3),
	},
}));

function SpeechToText() {
	const classes = useStyles();
	const [userDetails, setUserDetails] = useState({
		name: '',
		email: '',
	});
	const [accessToken, setAccessToken] = useState('');
	const [streams, setStreams] = useState({});
	const [events, setEvents] = useState([]);
	const [liveTranscript, setLiveTranscript] = useState({
		payload: {
			content: '',
		},
	});
	const [open, setOpen] = useState(false);

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

	const handleChange = event => {
		const { name, value } = event.target;

		setUserDetails(prevValue => {
			return {
				...prevValue,
				[name]: value,
			};
		});
	};

	console.log(streams);

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

	const start = async action => {
		try {
			if (accessToken) {
				console.log(action);
				let user = {
					name: '',
					email: '',
				};
				action === 'proceed' && (user = userDetails);
				const streamsResponse = await startStream({ accessToken, onSpeechDetected, user });
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

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = action => {
		typeof action === 'string' && start(action);
		setOpen(false);
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
							Control
						</Typography>
						<Button
							variant='contained'
							color='primary'
							startIcon={<MicIcon />}
							onClick={handleClickOpen}
							disabled={Object.keys(streams).length > 0}
						>
							Talk
						</Button>
						<Dialog
							open={open}
							onClose={handleClose}
							aria-labelledby='form-dialog-title'
						>
							<DialogTitle id='form-dialog-title'>Get Insights in Email</DialogTitle>
							<DialogContent>
								<DialogContentText>
									Before we start, do you want to get the Insights of the meeting
									in your email? If yes, please enter the details and proceed.
								</DialogContentText>
								<TextField
									name='name'
									id='name'
									label='Name'
									variant='standard'
									fullWidth
									style={{ marginBottom: 15 }}
									onChange={handleChange}
									value={userDetails.name}
								/>
								<TextField
									name='email'
									id='email'
									label='Email Address'
									type='email'
									variant='standard'
									fullWidth
									onChange={handleChange}
									value={userDetails.email}
								/>
							</DialogContent>
							<DialogActions>
								<Button onClick={() => handleClose('skip')} color='primary'>
									Skip
								</Button>
								<Button onClick={() => handleClose('proceed')} color='primary'>
									Proceed
								</Button>
							</DialogActions>
						</Dialog>
						<Button
							variant='contained'
							color='primary'
							className={classes.button}
							startIcon={<CloseIcon />}
							onClick={stop}
							disabled={Object.keys(streams).length === 0}
						>
							End
						</Button>
					</Paper>
					<Paper variant={'outlined'} className={classes.paperMargin}>
						<Typography variant={'h6'} style={{ marginBottom: 15, paddingBottom: 10 }}>
							Transcript
						</Typography>
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
