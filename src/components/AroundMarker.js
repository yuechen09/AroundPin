import React from 'react';
import { Marker, InfoWindow } from 'react-google-maps';
import blueMarkerUrl from '../assets/images/blue-marker.svg';

export class AroundMarker extends React.Component {
    state = {
        isOpen: false,
    }

    toggleOpen = () => {
        this.setState(prevState => ({ isOpen: !prevState.isOpen }));
    }

    render() {
        const { user, message, url, location, type} = this.props.post;
        const { lat, lon: lng } = location;
        const isImagePost = type === 'image';
        const icon = isImagePost ? undefined : {  // use blue marker when video post
            url: blueMarkerUrl,
            scaledSize: new window.google.maps.Size(26, 41),
        };
        return (
            <Marker
                position={{ lat, lng }}
                onMouseOver={isImagePost ? this.toggleOpen : undefined}
                onMouseOut={isImagePost ? this.toggleOpen : undefined}
                onClick={!isImagePost ? this.toggleOpen : undefined} // if is video post, only show it when click
                icon={icon}
            >
                {this.state.isOpen ? (
                    <InfoWindow onCloseClick={this.toggleOpen}>
                        <div>
                            {
                                isImagePost ? (
                                    <img
                                        src={url}
                                        alt={message}
                                        className="around-marker-image"
                                    />
                                ) :
                                    <video
                                        src={url}
                                        controls
                                        className="around-marker-video" //css
                                    />
                            }
                            <p>{`${user}: ${message}`}</p>
                        </div>
                    </InfoWindow>
                ) : null}
            </Marker>
        );
    }
}
