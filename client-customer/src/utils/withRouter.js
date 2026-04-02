import { useLocation, useNavigate, useParams } from "react-router-dom";

function withRouter(Component) {
  return function ComponentWithRouterProp(props) {
    return (
      <Component
        {...props}
        location={useLocation()}
        navigate={useNavigate()}
        params={useParams()}
      />
    );
  };
}

export default withRouter;
