import { h } from 'preact';
import { IconDefinition, icon as createIcon } from '@fortawesome/fontawesome-svg-core';

export function IconElement({
    icon
}: {
    icon: IconDefinition;
}) {
    if (!icon) {
        return <div />;
    }
    return <div dangerouslySetInnerHTML= {{__html: createIcon(icon).html.join('')}} />;
}
