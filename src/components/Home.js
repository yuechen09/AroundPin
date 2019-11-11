
import React from 'react';
import { Tabs, Row, Col, Spin, Radio } from 'antd';
import { GEO_OPTIONS, POS_KEY, API_ROOT, AUTH_HEADER, TOKEN_KEY } from '../constants';
import {Gallery} from "./Gallery";
import { CreatePostButton} from "./CreatePostButton";
import {AroundMap} from "./AroundMap";

const TabPane  = Tabs.TabPane;
const RadioGroup = Radio.Group;

export class Home extends React.Component {
    state = {
        isLoadingGeoLocation: false,
        isLoadingPosts: false,
        error: '',
        posts:[],
        topic: 'around',
    }
    componentDidMount() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS
            );
            this.setState({isLoadingGeoLocation : true});
        } else {
            this.setState({error: 'Geolocation is not supported.'});
        }
    }
    onSuccessLoadGeoLocation = (position) => {
        console.log(position);
        const { latitude, longitude } = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({ lat: latitude, lon: longitude }));
        this.setState({ isLoadingGeoLocation: false });
        this.loadNearbyPosts();
    }
    onFailedLoadGeoLocation = () => {
        this.setState({ isLoadingGeoLocation : false, error: 'Failed to load geolocation.' });
    }
    loadNearbyPosts = (center, radius) => {
        const { lat, lon } = center || JSON.parse(localStorage.getItem(POS_KEY));
        const range = radius || 20;
        const token = localStorage.getItem(TOKEN_KEY);
        this.setState({ isLoadingPosts: true});
        fetch(`${API_ROOT}/search?lat=${lat}&lon=${lon}&range=${range}`, {
            method: 'GET',
            headers: {
                Authorization: `${AUTH_HEADER} ${token}`,
            },
            mode: 'no-cors',
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to load posts.');
        }).then((data) => {
            console.log(data);
            this.setState({ isLoadingPosts: false, posts: data ? data : [] });
        }).catch((e) => {
            console.log(e.message);
            this.setState({ isLoadingPosts: false, error: e.message });
        });
    }
    getPanelContent = (type) => {
        const { error, isLoadingGeoLocation, isLoadingPosts, posts } = this.state;
        if (error) {
            return <div>{error}</div>
        } else if(isLoadingGeoLocation) {
            return <Spin tip="Loading geo location..."/>
        } else if (isLoadingPosts) {
            return <Spin tip="Loading posts..." />
        } else if (posts.length > 0) {
            return type === 'image' ? this.getImagePosts() : this.getVideoPosts();
        } else {
            return 'No nearby posts.';
        }
    }

    getVideoPosts = () => {
        return (
            <Row gutter={32}>
                {
                    this.state.posts
                        .filter((post) => post.type === 'video')
                        .map((post) => (
                            <Col span={6} key={post.url}>
                                <video src={post.url} controls className="video-block"/>
                                <p>{`${post.user}: ${post.message}`}</p>
                            </Col>
                        ))
                }
            </Row>
        );
    }

    getImagePosts = () => {
        const images = this.state.posts
            .filter((post) => post.type === 'image')  // only show image post
            .map((post) => {
                return {
                    user: post.user,
                    src: post.url,
                    thumbnail: post.url,
                    caption: post.message,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                }
            });
        return (<Gallery images={images}/>);
    }
    onTopicChange = (e) => {
        const topic = e.target.value;
        this.setState({topic});
        this.updatePosts({topic});
    }
    loadFacesAroundTheWorld = (e) => {
        const token = localStorage.getItem(TOKEN_KEY);
        this.setState({ isLoadingPosts: true});
        fetch(`${API_ROOT}/cluster?term=face}`, {
            method: 'GET',
            headers: {
                Authorization: `${AUTH_HEADER} ${token}`,
            },
            mode: 'no-cors',
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to load posts.');
        }).then((data) => {
            console.log(data);
            this.setState({ isLoadingPosts: false, posts: data ? data : [] });
        }).catch((e) => {
            console.log(e.message);
            this.setState({ isLoadingPosts: false, error: e.message });
        });
    }
    updatePosts = ({topic, center, radius}) => {
        topic = topic || this.state.topic;
        if (topic === 'around') {
            this.loadNearbyPosts(center, radius);
        } else {
            this.loadFacesAroundTheWorld();
        }
    }
    render() {
        console.log('state:', this.state);
        const operations = <CreatePostButton loadNearbyPosts={this.loadNearbyPosts}/>;

        return (
            <div>
                <RadioGroup onChange={this.onTopicChange} value={this.state.topic}>
                    <Radio value="around">Posts Around Me</Radio>
                    <Radio value="face">Faces Around The World</Radio>
                </RadioGroup>
                <Tabs tabBarExtraContent={operations} className= "main-tabs">
                    <TabPane tab="Image Posts" key="1">
                        {this.getPanelContent()}
                    </TabPane>
                    <TabPane tab="Video Posts" key="2">
                        {this.getPanelContent()}
                    </TabPane>
                    <TabPane tab="Map" key="3">
                        <AroundMap
                            isMarkerShown
                            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyD3CEh9DXuyjozqptVB5LA-dN7MxWWkr9s"
                            loadingElement={<div style={{ height: `100%` }} />}
                            containerElement={<div style={{ height: `800px` }} />}
                            mapElement={<div style={{ height: `100%` }} />}
                            posts = {this.state.posts}
                            updatePosts={this.updatePosts}
                        />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}
