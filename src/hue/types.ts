
export interface ResourceMetadata {
    name: string,
}

export interface Position {
    x: number,
    y: number,
    z: number,
}

export interface ServiceReference {
    rid: string,
    rtype: string,
}

export interface SegmentReferenceGet {
    service: ServiceReference,
    index: number,
}

export interface EntertainmentChannelGet {
    channel_id: number,
    position: Position,
    members: SegmentReferenceGet,
}

export type EntertainmentConfigurationType = 'screen' | 'monitor' | 'music' | '3dspace' | 'other';
export type EntertainmentStatus = 'active' | 'inactive';

export interface EntertainmentConfigurationGet {
    type: 'entertainment_configuration',
    id: string,
    id_v1: string,
    metadata: ResourceMetadata,
    configuration_type: EntertainmentConfigurationType,
    status: EntertainmentStatus,
    channels: EntertainmentChannelGet[],
}
