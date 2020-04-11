import { Component, h } from 'preact';
import {Watchable} from 'logic/helpers/watchable';

interface Props<T1> {
    property: T1;
    render: (property: T1) => h.JSX.Element | h.JSX.Element[];
}

export class Watch<T1 extends Watchable> extends Component<Props<T1>> {
    public state: {
        value: T1;
    }

    public constructor(props) {
        super(props);
        this.onUpdate = this.onUpdate.bind(this);

        this.state = {
            value: this.props.property
        };
    }

    public componentWillUpdate(newProps) {
        this.setState({
            value: newProps.property
        });
        this.props.property.unsubscribe(this.onUpdate);
        newProps.property.subscribe(this.onUpdate);
    }

    public componentDidMount() {
        this.props.property.subscribe(this.onUpdate);
    }

    public componentWillUnmount() {
        this.props.property.unsubscribe(this.onUpdate);
    }

    public render() {
        return this.props.render(this.state.value);
    }

    private onUpdate() {
        this?.setState({
            value: this.props.property
        });
    }
}