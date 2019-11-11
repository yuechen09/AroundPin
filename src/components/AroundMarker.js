import React from 'react';
import { Marker, InfoWindow } from 'react-google-maps';

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
        return (
            <Marker
                position={{ lat, lng }}
                onMouseOver={this.toggleOpen}
                onMouseOut={this.toggleOpen}
            >
                {this.state.isOpen ? (
                    <InfoWindow onCloseClick={this.toggleOpen}>
                        <div>
                            {
                                type === "image" ? (
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
