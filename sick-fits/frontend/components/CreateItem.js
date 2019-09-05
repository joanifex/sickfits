import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import Router from 'next/router';

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0,
  };

  handleChange = e => {
    const { name, type, value } = e.target;
    this.setState({ [name]: type === 'number' ? parseFloat(value) : value });
  };

  uploadFile = async e => {
    console.log(e);
    const files = e.target.files;
    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'sickfits');
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/wrightianb/image/upload',
      { method: 'POST', body: data },
    );
    const file = await response.json();
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url,
    });
  };

  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form
            onSubmit={async e => {
              e.preventDefault();
              const response = await createItem();
              Router.push({
                pathname: '/item',
                query: { id: response.data.createItem.id },
              });
            }}>
            <Error error={error} />
            <label htmlFor="file">
              Image
              <input
                type="file"
                id="file"
                name="file"
                onChange={this.uploadFile}
                placeholder="Upload an image"
                required
              />
              {this.state.image && (
                <img src={this.state.image} alt="Upload Preview" width="200" />
              )}
            </label>
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  onChange={this.handleChange}
                  placeholder="Title"
                  required
                  value={this.state.title}
                />
              </label>
              <label htmlFor="price">
                Price
                <input
                  type="number"
                  id="price"
                  name="price"
                  onChange={this.handleChange}
                  placeholder="Price"
                  required
                  value={this.state.price}
                />
              </label>
              <label htmlFor="description">
                Description
                <textarea
                  id="description"
                  name="description"
                  onChange={this.handleChange}
                  placeholder="Description"
                  required
                  value={this.state.description}
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };
