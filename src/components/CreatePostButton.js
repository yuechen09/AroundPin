import React from 'react';
import {Modal, Button, message} from 'antd';
import { CreatePostForm } from './CreatePostForm';
import {API_ROOT, AUTH_HEADER, POS_KEY, TOKEN_KEY, LOC_SHAKE} from "../constants";

export class CreatePostButton extends React.Component {
    state = {
        ModalText: 'Content of the modal',
        visible: false,
        confirmLoading: false,
    };

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = () => {
        this.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form:', values);
                this.setState({
                    ModalText: 'The modal will be closed after two seconds',
                    confirmLoading: true,
                });
                const { lat, lon } = JSON.parse(localStorage.getItem(POS_KEY));
                const token = localStorage.getItem(TOKEN_KEY);
                let formData = new FormData();
                // for multiple posts in the same location, create random locations so that they won't overlap
                formData.set('lat', lat + LOC_SHAKE * Math.random() * 2 - LOC_SHAKE);
                formData.set('lon', lon + LOC_SHAKE * Math.random() * 2 - LOC_SHAKE);
                formData.set('message', values.message);
                formData.set('image', values.image[0].originFileObj);

                fetch(`${API_ROOT}/post`, {
                    mode: 'no-cors',
                    method: 'POST',
                    body: formData,// form data
                    headers: {
                    Authorization: `${AUTH_HEADER} ${token}`,
                }
                }).then((response) => {
                    if (response.ok) {
                        this.form.resetFields(); // clear the form
                        this.setState({
                            confirmLoading: false,
                            visible: false
                        });
                        return this.props.loadNearbyPosts();
                    }
                    throw new Error(response.statusText);
                }).then((data) => {
                        message.success('Post Created Success!')
                }).catch((e) => {
                    console.log(e);
                    this.setState({ confirmLoading: false });
                    message.error('Failed to Create the Post.');
                });
            }
        });
    }

    handleCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            visible: false,
        });
    };

    getFormRef = (formInstance) => {
        this.form = formInstance;
    }
    render() {
        const { visible, confirmLoading, ModalText } = this.state;
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>
                    Create New Post
                </Button>
                <Modal
                    title="Create New Post"
                    visible={visible}
                    onOk={this.handleOk}
                    okText= "Create"
                    confirmLoading={confirmLoading}
                    onCancel={this.handleCancel}
                >
                    <CreatePostForm ref = {this.getFormRef}/>
                </Modal>
            </div>
        );
    }
}