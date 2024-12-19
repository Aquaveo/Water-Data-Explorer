import Error from 'features/react-tethys/components/error/Error';

import errorImage from 'assets/error.png';

const GenericError = () => {
  return (
    <Error title="Whoops!" image={errorImage}>
      Something went wrong. Please try again.
    </Error>
  );
};

export default GenericError;