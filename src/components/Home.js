
import React from 'react';
import { Tabs, Button, Spin } from 'antd';
import { GEO_OPTIONS, POS_KEY, API_ROOT, AUTH_HEADER, TOKEN_KEY } from '../constants';
import {Gallery} from "./Gallery";
import { CreatePostButton} from "./CreatePostButton";

const { TabPane } = Tabs;

export class Home extends React.Component {
    state = {
        isLoadingGeoLocation: false,
        isLoadingPosts: false,
        error: '',
        posts:[],
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
    loadNearbyPosts = () => {
        const { lat, lon } = JSON.parse(localStorage.getItem(POS_KEY));
        const token = localStorage.getItem(TOKEN_KEY);
        this.setState({ isLoadingPosts: true});
        fetch(`${API_ROOT}/search?lat=${lat}&lon=${lon}&range=20000`, {
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

    getImagePosts = () => {
        const { error, isLoadingGeoLocation, isLoadingPosts, posts } = this.state;
        if (error) {
            return <div>{error}</div>
        } else if(isLoadingGeoLocation) {
            return <Spin tip="Loading geo location..."/>
        } else if (isLoadingPosts) {
            return <Spin tip="Loading posts..." />
        } else if (posts.length > 0) {
            const images = this.state.posts.map((post) => {
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
        } else {
            return 'No nearby posts.';
        }
    }

    render() {
        console.log('state:', this.state);
        const operations = <CreatePostButton loadNearbyPosts={this.loadNearbyPosts}/>;

        return (
            <Tabs tabBarExtraContent={operations} className= "main-tabs">
                <TabPane tab="Posts" key="1">
                    {this.getImagePosts()}
                </TabPane>
                <TabPane tab="Map" key="2">Content of tab 2</TabPane>
            </Tabs>
        );
    }
}
