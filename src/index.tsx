import * as React from 'react';
import {
  requireNativeComponent,
  View,
  findNodeHandle,
  Dimensions,
  ViewStyle,
  StyleProp,
  ViewProps,
} from 'react-native';

type PreviewAction =
  | {
      type: 'selected' | 'destructive';
      caption: string;
      action: () => void;
      group?: never;
    }
  | {
      group: PreviewAction[];
      caption: string;
      type?: never;
      action?: never;
    };

type MappedAction = (() => void) | undefined;

type TraveresedAction =
  | {
      caption: string;
      group: TraveresedAction[];
    }
  | {
      group?: never;
      type: 'selected' | 'destructive';
      caption: string;
      _key: number;
    };

type NativePeekAndPopleViewRef = {
  setNativeProps(props: { childRef: null | number }): void;
};

type ActionEvent = { nativeEvent: { key: number } };

type Props = ViewProps & {
  renderPreview: () => React.ReactNode;
  previewActions?: PreviewAction[];
  onPeek?: () => void;
  onPop?: () => void;
  onDisappear?: () => void;
  children: React.ReactNode;
};

type State = {
  visible: boolean;
  traversedActions: TraveresedAction[];
  mappedActions: MappedAction[];
};

const { width, height } = Dimensions.get('window');

export const NativePeekAndPopleView: React.ComponentType<{
  ref: React.RefObject<NativePeekAndPopleViewRef>;
  style: StyleProp<ViewStyle>;
  onPeek?: () => void;
  onPop?: () => void;
  onDisappear?: () => void;
  onAction: (event: ActionEvent) => void;
  previewActions: TraveresedAction[];
  children: React.ReactNode;
}> = requireNativeComponent('PeekAndPop');

const traverseActions = (
  actions: PreviewAction[],
  actionsMap: MappedAction[]
) => {
  const traversedAction: TraveresedAction[] = [];

  actions.forEach(currentAction => {
    if (currentAction.group) {
      const clonedAction = {
        ...currentAction,
        group: traverseActions(currentAction.group, actionsMap),
      };

      traversedAction.push(clonedAction);
    } else {
      const { action, ...clonedAction } = currentAction;
      // @ts-ignore
      clonedAction._key = actionsMap.length;
      actionsMap.push(action);
      traversedAction.push(clonedAction as TraveresedAction);
    }
  });
  return traversedAction;
};

export default class PeekableView extends React.Component<Props, State> {
  static getDerivedStateFromProps(props: Props) {
    const mappedActions: MappedAction[] = [];
    const traversedActions = props.previewActions
      ? traverseActions(props.previewActions, mappedActions)
      : undefined;

    return {
      traversedActions,
      mappedActions,
    };
  }

  state: State = {
    visible: false,
    traversedActions: [],
    mappedActions: [],
  };

  preview = React.createRef<NativePeekAndPopleViewRef>();
  sourceView = React.createRef<View>();

  componentDidMount() {
    this.preview.current &&
      this.preview.current.setNativeProps({
        childRef: findNodeHandle(this.sourceView.current),
      });
  }

  onDisappear = () => {
    this.setState({
      visible: false,
    });
    this.props.onDisappear && this.props.onDisappear();
  };

  onPeek = () => {
    this.setState({
      visible: true,
    });
    this.props.onPeek && this.props.onPeek();
  };

  onActionsEvent = ({ nativeEvent: { key } }: ActionEvent) => {
    const action = this.state.mappedActions[key];

    action && action();
  };

  render() {
    const {
      renderPreview,
      /* eslint-disable @typescript-eslint/no-unused-vars */
      previewActions,
      onPeek,
      onDisappear,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      onPop,
      children,
      ...rest
    } = this.props;

    return (
      <React.Fragment>
        <View {...rest} ref={this.sourceView}>
          <NativePeekAndPopleView
            // Renders nothing and inside view bound to the screen used by controller
            style={{ width: 0, height: 0 }}
            onDisappear={this.onDisappear}
            onPeek={this.onPeek}
            onPop={onPop}
            ref={this.preview}
            previewActions={this.state.traversedActions}
            onAction={this.onActionsEvent}
          >
            <View style={{ width, height }}>
              {this.state.visible ? renderPreview() : null}
            </View>
          </NativePeekAndPopleView>
          {children}
        </View>
      </React.Fragment>
    );
  }
}
